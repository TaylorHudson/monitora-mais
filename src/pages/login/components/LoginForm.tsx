import { Button } from "../../../components/ui/button"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { login } from "../../../services/authFetch";
import { useLoading } from "../../../contexts/LoadingContext";
import { toastApiError } from "../../../utils/toast";


const formSchemaLogin = z.object({
  matricula: z.string().min(1, "Campo Obrigatório").max(12, "Máximo 12 caracteres"),
  password: z.string().min(1, "Campo obrigatório"),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchemaLogin>>({
    resolver: zodResolver(formSchemaLogin),
    defaultValues: {
      matricula: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { setLoading } = useLoading();

  async function onSubmit(values: z.infer<typeof formSchemaLogin>) {
    try {
      await login(values.matricula, values.password, setLoading);
      if (/^\d{7}$/.test(values.matricula)) {
        navigate("/professor/disciplinas");
      } else {
        navigate("/requisitar-horario");
      }
    } catch (err: Error | any) {
      toastApiError(err);
    }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="matricula"
          render={({ field }) => (
            <FormItem>
              <FormControl className="w-full">
                <Input placeholder="Matrícula" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl className="w-full">
                <Input placeholder="Senha" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button type="submit" className="w-full text-white bg-green-700 hover:bg-green-800">Entrar</Button>
        </div>
      </form>
    </Form>   
    </>
  )
}

